import urllib.request
import re

html = urllib.request.urlopen('http://localhost:3000').read().decode('utf-8')
m = re.search(r'href="(/_next/static/css/[^"]+)"', html)
if m:
    css_url = m.group(1)
    print("Found CSS URL:", css_url)
    res = urllib.request.urlopen("http://localhost:3000" + css_url)
    data = res.read().decode("utf-8")
    print(f"HTTP Status: {res.getcode()} | CSS Size: {len(data)} bytes")
    print("Sample:", data[:150])
else:
    print("No CSS link found in HTML!")
