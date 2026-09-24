import os
import zipfile

zip_filename = 'box-factory-windows-setup.zip'
if os.path.exists(zip_filename):
    os.remove(zip_filename)

with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
    # 1. Add server folder (excluding node_modules and logs)
    for root, dirs, files in os.walk('server'):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        for file in files:
            path = os.path.join(root, file)
            zipf.write(path, os.path.relpath(path, '.'))

    # 2. Add client/dist folder (compiled production frontend)
    for root, dirs, files in os.walk('client/dist'):
        for file in files:
            path = os.path.join(root, file)
            zipf.write(path, os.path.relpath(path, '.'))

    # 3. Add windows-setup folder
    for root, dirs, files in os.walk('windows-setup'):
        for file in files:
            path = os.path.join(root, file)
            zipf.write(path, os.path.relpath(path, '.'))

    # 4. Add root update and install convenience shortcuts
    zipf.write('windows-setup/update.bat', 'update.bat')
    zipf.write('windows-setup/install.bat', 'install.bat')
    zipf.write('package.json', 'package.json')
    zipf.write('README.md', 'README.md')

print(f"Zip created successfully: {zip_filename} (Size: {os.path.getsize(zip_filename) / (1024*1024):.2f} MB)")
