from app.database import get_supabase_admin

def list_bucket():
    s = get_supabase_admin().storage.from_("documentos")
    folders = s.list()
    print("Folders/Files in root:")
    for item in folders:
        print(item)
        if item.get('id') is None and 'name' in item:
            print(f"\nContents of folder {item['name']}:")
            sub_files = s.list(item['name'])
            for f in sub_files:
                path = f"{item['name']}/{f['name']}"
                print("  Found file path:", path)
                # Let's see what public URL it generates for this path:
                pub_url = s.get_public_url(path)
                print("  Public URL:", pub_url)
                
                # simulate extraction
                path_prefix = "/public/documentos/"
                if path_prefix in pub_url:
                    extracted = pub_url.split(path_prefix)[-1]
                    import urllib.parse
                    decoded = urllib.parse.unquote(extracted)
                    print("  Extracted (decoded):", decoded)
                    if decoded == path:
                        print("  MATCH!")
                    else:
                        print("  MISMATCH!")
                else:
                    print("  NO PREFIX FOUND")

if __name__ == "__main__":
    list_bucket()
