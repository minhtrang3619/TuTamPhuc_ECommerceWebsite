import zipfile, json, sys
zip_path = r'e:/Tu_Tam_Phuc_E_Commerce_Website/stitch_t_t_m_ph_c_zen_e_commerce (8).zip'
with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    for name in zip_ref.namelist():
        print(name)
