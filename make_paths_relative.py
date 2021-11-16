from pathlib import Path
import re

def make_paths_relative(build_folder):
    file = Path(build_folder+"index.html")
    text = file.read_text()

    offset = 0
    for pat in re.finditer(r'(\=\"\/)(.*?)(\")', text):
        span = pat.span()
        if pat.groups()[1][:2] != "js":
            text = text[:span[0]+offset] + '="./' + pat.groups()[1] + '"' + text[span[1]+offset:]
            offset += 1

    offset = 0

    for pat in re.finditer(r'(:url\(\/)(.*?)(\))', text):
        span = pat.span()
        text = text[:span[0]+offset] + ':url(./' + pat.groups()[1] + ')' + text[span[1]+offset:]
        offset += 1
    
    file.write_text(text)

def main():
    make_paths_relative("./build/")

if __name__ == '__main__':
    main()
