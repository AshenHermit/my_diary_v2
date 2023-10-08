import os
from argparse import ArgumentParser
import make_paths_relative
import ftplib
from socket import _GLOBAL_DEFAULT_TIMEOUT
import traceback

output_folder = "dist"

class ExtendedFTP(ftplib.FTP):
    def __init__(self, host='', user='', passwd='', acct='',
                 timeout=_GLOBAL_DEFAULT_TIMEOUT, source_address=None, *,
                 encoding='utf-8') -> None:
        super().__init__(host=host, user=user, passwd=passwd, acct=acct, timeout=timeout, source_address=source_address, encoding=encoding)

    def upload_folder_recursively(self, path:str):
        files = os.listdir(path)
        os.chdir(path)
        for f in files:
            if os.path.isfile(f):
                fh = open(f, 'rb')
                self.storbinary(f'STOR {f}', fh)
                print(f"stor {f}")
                fh.close()
            elif os.path.isdir(f):
                if not f in self.nlst(): self.mkd(f)
                self.cwd(f)
                print(f"cwd {f}")
                self.upload_folder_recursively(f)
        self.cwd('..')
        os.chdir('..')
        print("cwd ..")

    def upload_folder(self, folder_path:str):
        print(f'uploading "{folder_path}" with ftp')
        self.upload_folder_recursively(folder_path)
        print("uploaded")
    

def build():
    os.system("npm run build")
    make_paths_relative.make_paths_relative("./build/")

def upload(ftp_host, ftp_username, ftp_password, ftp_folder):
    print(f'uploading to remote folder "{ftp_folder}"')
    ftp = ExtendedFTP(ftp_host, ftp_username, ftp_password)
    ftp.cwd(ftp_folder)
    ftp.upload_folder(output_folder)

def main():
    parser = ArgumentParser()
    parser.add_argument("-b", "--build", action="store_true")
    parser.add_argument("-u", "--upload", action="store_true")
    parser.add_argument("--ftp-host", type=str)
    parser.add_argument("--ftp-username", type=str)
    parser.add_argument("--ftp-password", type=str)
    parser.add_argument("--ftp-folder", type=str)
    args = parser.parse_args()
    print("...")

    try:
        if args.build:
            build()
        if args.upload:
            upload(args.ftp_host, args.ftp_username, args.ftp_password, args.ftp_folder)
        print("done.")
    except Exception as e:
        traceback.print_exc()


if __name__ == '__main__':
    main()