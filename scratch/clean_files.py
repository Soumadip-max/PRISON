import os
import re

def clean_file(filepath, is_registry_or_docs=False):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove tailwind CDN scripts
    content = re.sub(r'<script src="https://cdn\.tailwindcss\.com[^>]*>\s*</script>', '', content)
    # Remove google fonts links
    content = re.sub(r'<link href="https://fonts\.googleapis\.com"[^>]*>', '', content)
    content = re.sub(r'<link crossOrigin="?[^>]*href="https://fonts\.gstatic\.com"[^>]*>', '', content)
    content = re.sub(r'<link href="https://fonts\.googleapis\.com/css2[^>]*>', '', content)
    
    # Remove tailwind config script
    content = re.sub(r'<script\s*data-purpose="tailwind-config"[^>]*>.*?</script>', '', content, flags=re.DOTALL)
    content = re.sub(r'<script\s*dangerouslySetInnerHTML={{[^}]*__html:\s*`\s*tailwind\.config[^`]*`\s*}}\s*/>', '', content, flags=re.DOTALL)

    # Remove <header> block entirely
    content = re.sub(r'<header[^>]*>.*?</header>', '', content, flags=re.DOTALL)

    # In registry and docs, font-pixel was mapped to Press Start 2P, so rename to font-arcade
    if is_registry_or_docs:
        content = content.replace('font-pixel', 'font-arcade')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

base_dir = r"c:\Users\Sujoy Dey\Desktop\My Projects\PRISON\apps\web\src\app"

clean_file(os.path.join(base_dir, "page.js"))
clean_file(os.path.join(base_dir, "sandbox", "page.js"))
clean_file(os.path.join(base_dir, "registry", "page.js"), is_registry_or_docs=True)
clean_file(os.path.join(base_dir, "docs", "page.js"), is_registry_or_docs=True)

print("Files cleaned up successfully.")
