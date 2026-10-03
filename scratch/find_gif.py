import urllib.request
import re

url = 'https://tenor.com/search/hacker-desk-pixel-art-gifs'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    urls = re.findall(r'https://media\.tenor\.com/[A-Za-z0-9_-]+/[^"\'\s]+\.gif', html)
    print("Found GIFs:")
    for u in list(set(urls))[:5]:
        print(u)
except Exception as e:
    print(f"Error: {e}")
