import pandas as pd
import json
import os
import sys

def convert_excel_to_json(excel_file, output_file):
    """
    Конвертирует Excel-файл с сообщениями в JSON-файл
    
    Args:
        excel_file (str): Путь к Excel-файлу
        output_file (str): Путь для сохранения JSON-файла
    """
    try:
        print(f"Загрузка Excel-файла: {excel_file}")
        
        # Загружаем Excel-файл
        df = pd.read_excel(excel_file)
        
        # Проверяем, есть ли данные
        if df.empty:
            print("Ошибка: Excel-файл не содержит данных")
            return False
            
        # Получаем список столбцов
        columns = df.columns.tolist()
        print(f"Найдены столбцы: {columns}")
        
        # Если в данных нет столбца с текстом сообщения, пытаемся найти подходящий
        text_column = None
        possible_text_columns = ['text', 'message', 'сообщение', 'текст', 'содержание']
        
        for col in possible_text_columns:
            if col in columns:
                text_column = col
                break
        
        if not text_column and len(columns) > 0:
            # Если не нашли по имени, берем первый столбец
            text_column = columns[0]
            print(f"Используем первый столбец '{text_column}' как столбец с текстом сообщений")
        
        if not text_column:
            print("Ошибка: Не удалось определить столбец с текстом сообщений")
            return False
            
        # Конвертируем в список словарей
        messages = []
        for _, row in df.iterrows():
            if pd.isna(row[text_column]) or str(row[text_column]).strip() == '':
                continue
                
            message = {
                'text': str(row[text_column]).strip()
            }
            
            # Добавляем категорию, если она есть
            category_column = None
            possible_category_columns = ['category', 'категория', 'тип', 'type']
            
            for col in possible_category_columns:
                if col in columns:
                    category_column = col
                    break
            
            if category_column and not pd.isna(row[category_column]):
                message['category'] = str(row[category_column]).strip()
            
            # Добавляем ключевые слова, если они есть
            keywords_column = None
            possible_keywords_columns = ['keywords', 'ключевые_слова', 'ключевые слова', 'теги', 'tags']
            
            for col in possible_keywords_columns:
                if col in columns:
                    keywords_column = col
                    break
            
            if keywords_column and not pd.isna(row[keywords_column]):
                keywords = str(row[keywords_column]).strip()
                if keywords:
                    message['keywords'] = [kw.strip() for kw in keywords.split(',')]
            
            messages.append(message)
        
        # Сохраняем в JSON
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(messages, f, ensure_ascii=False, indent=2)
        
        print(f"Успешно сконвертировано {len(messages)} сообщений")
        print(f"JSON-файл сохранен: {output_file}")
        return True
    
    except Exception as e:
        print(f"Ошибка при конвертации: {str(e)}")
        return False

if __name__ == "__main__":
    # Если передан путь к файлу через аргументы
    if len(sys.argv) > 1:
        excel_path = sys.argv[1]
        json_path = sys.argv[2] if len(sys.argv) > 2 else "data/messages.json"
    else:
        # Иначе ищем файл Excel в текущей директории
        excel_files = [f for f in os.listdir('.') if f.lower().endswith('.xlsx') and 'сообщ' in f.lower()]
        
        if not excel_files:
            print("Ошибка: Не найден файл Excel с сообщениями")
            print("Использование: python excel_to_json.py <путь_к_excel> [путь_к_json]")
            sys.exit(1)
        
        excel_path = excel_files[0]
        json_path = "data/messages.json"
    
    print(f"Выбран файл: {excel_path}")
    print(f"Результат будет сохранен в: {json_path}")
    
    # Создаем директорию, если не существует
    os.makedirs(os.path.dirname(json_path), exist_ok=True)
    
    success = convert_excel_to_json(excel_path, json_path)
    sys.exit(0 if success else 1) 