import re
import zlib

def extract_text_from_pdf(pdf_path):
    with open(pdf_path, 'rb') as f:
        content = f.read()
    
    streams = []
    start = 0
    while True:
        pos = content.find(b'stream', start)
        if pos == -1:
            break
        # stream keyword is followed by newline
        if content[pos+6:pos+8] == b'\r\n':
            data_start = pos + 8
        elif content[pos+6:pos+7] == b'\n':
            data_start = pos + 7
        else:
            data_start = pos + 6
        
        data_end = content.find(b'endstream', data_start)
        if data_end == -1:
            break
        
        compressed_data = content[data_start:data_end]
        if compressed_data.endswith(b'\r\n'):
            compressed_data = compressed_data[:-2]
        elif compressed_data.endswith(b'\n'):
            compressed_data = compressed_data[:-1]
            
        streams.append(compressed_data)
        start = data_end + 9
        
    print(f"Found {len(streams)} stream objects.")
    
    text_pieces = []
    for idx, stream in enumerate(streams):
        try:
            decompressed = zlib.decompress(stream)
        except Exception:
            try:
                decompressed = zlib.decompress(stream, -zlib.MAX_WBITS)
            except Exception:
                continue
        
        # Look for text strings in the decompressed stream.
        # Also decode bytes correctly. Since PDF can use Octal escapes for unicode or latin1,
        # let's try a simple approach first.
        
        # Simple extraction of text in parentheses
        raw_strings = re.findall(rb'\(([^()]*)\)', decompressed)
        if not raw_strings:
            continue
            
        decoded_text = []
        for s in raw_strings:
            # Skip common short abbreviations or single characters if they're not text
            try:
                # Octal escapes conversion (e.g. \343 for ã)
                # Let's replace octal sequences in the string
                parts = re.split(rb'\\([0-7]{3})', s)
                new_s = b''
                for i, part in enumerate(parts):
                    if i % 2 == 1:
                        new_s += bytes([int(part, 8)])
                    else:
                        new_s += part
                decoded = new_s.decode('latin1', errors='ignore')
                # Simple cleanup of octals if any are left
                decoded_text.append(decoded)
            except Exception:
                pass
        
        if decoded_text:
            text_pieces.append(f"--- Stream {idx} ---\n" + " ".join(decoded_text))
            
    return "\n\n".join(text_pieces)

if __name__ == "__main__":
    text = extract_text_from_pdf("documentacao/ModelagemBancodeDados.pdf")
    with open("documentacao/ModelagemBancodeDados_extracted.txt", "w", encoding="utf-8") as f:
        f.write(text)
    print("Done. Text written to documentacao/ModelagemBancodeDados_extracted.txt")
