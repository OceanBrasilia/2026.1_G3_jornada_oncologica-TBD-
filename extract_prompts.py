import json
import glob
import os

conversations = [
    "53d491e7-49c4-4fdf-993a-cdc5aa545bba", # Medico
    "ac03b7ca-8d40-4413-b78a-dd815d0f9f4a", # Nutricional
    "37fc2528-16eb-4d6d-a0db-27de774e1700", # Psico
    "d55b8a65-b456-4c09-9a6c-91d88c1ae214", # Fisio
    "2fdc20a4-9c70-40ac-b4e0-2332922d7b8f", # Serviço Social
    "3a04fe63-801e-43b1-8548-59b0bda2878d", # Odonto
    "f1ed084a-0a82-494e-a833-2e86049fc3cd", # Fono
    "afd755aa-4eaf-4466-8296-41a1036a26b5", # TO
    "b006eb26-9be4-44b2-a45b-c125c13d3cab", # Multidisciplinar
]

for cid in conversations:
    path = f"/Users/felipemarinho/.gemini/antigravity-ide/brain/{cid}/.system_generated/logs/transcript.jsonl"
    if os.path.exists(path):
        with open(path, 'r') as f:
            for line in f:
                data = json.loads(line)
                if data.get('type') == 'USER_INPUT':
                    content = data.get('content', '')
                    if 'perguntas' in content.lower() or 'campos' in content.lower() or 'formulário' in content.lower() or 'issue 6' in content.lower():
                        print(f"--- CONVERSATION {cid} ---")
                        # print first 500 chars to avoid huge outputs
                        print(content[:500])
                        print("="*40)
                        
