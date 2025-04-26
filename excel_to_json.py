import pandas as pd
import json
import sys
import os

def excel_to_json(excel_file, json_file):
    try:
        # Читаем Excel файл
        df = pd.read_excel(excel_file)
        
        # Конвертируем DataFrame в список словарей
        data = df.to_dict(orient='records')
        
        # Записываем в JSON файл с правильной кодировкой
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
            
        print(f"Успешно конвертировано: {excel_file} -> {json_file}")
        return True
        
    except Exception as e:
        print(f"Ошибка при конвертации: {str(e)}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Использование: python excel_to_json.py input.xlsx output.json")
        sys.exit(1)
        
    excel_file = sys.argv[1]
    json_file = sys.argv[2]
    
    if not os.path.exists(excel_file):
        print(f"Ошибка: Файл {excel_file} не найден")
        sys.exit(1)
        
    excel_to_json(excel_file, json_file) 