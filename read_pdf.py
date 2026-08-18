import sys

def main():
    pdf_path = "documentacao/ModelagemBancodeDados.pdf"
    
    # Try importing pypdf
    try:
        import pypdf
        print("Using pypdf")
        reader = pypdf.PdfReader(pdf_path)
        for i, page in enumerate(reader.pages):
            print(f"--- Page {i+1} ---")
            print(page.extract_text())
        return
    except ImportError:
        pass

    try:
        import fitz # PyMuPDF
        print("Using pymupdf")
        doc = fitz.open(pdf_path)
        for i, page in enumerate(doc):
            print(f"--- Page {i+1} ---")
            print(page.get_text())
        return
    except ImportError:
        pass

    try:
        import pdfplumber
        print("Using pdfplumber")
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                print(f"--- Page {i+1} ---")
                print(page.extract_text())
        return
    except ImportError:
        pass

    # If none is installed, try installing pypdf and then run again
    print("No library found. Installing pypdf...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
    
    import pypdf
    reader = pypdf.PdfReader(pdf_path)
    for i, page in enumerate(reader.pages):
        print(f"--- Page {i+1} ---")
        print(page.extract_text())

if __name__ == "__main__":
    main()
