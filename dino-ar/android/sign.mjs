// امضای APK با اسکیم‌های v1+v2+v3 — بدون نیاز به apksigner
// usage: node sign.mjs <aligned.apk> <keystore.jks> <password> <out.apk>
import { readFileSync, writeFileSync } from 'node:fs';
import { ApkSigner, SigningKey, convertToPEM } from 'apk_sign_ts';

const [apkPath, ksPath, pass, outPath] = process.argv.slice(2);
const apk = new Uint8Array(readFileSync(apkPath));
const keystore = new Uint8Array(readFileSync(ksPath));

const { privateKey, certificate } = await convertToPEM(keystore, pass, 'jks');
const signer = new ApkSigner({ signingKey: SigningKey.fromPEM(privateKey, certificate) });
const { signedApk } = await signer.sign(apk);
writeFileSync(outPath, signedApk);
console.log('signed ->', outPath, (signedApk.length / 1048576).toFixed(1) + 'MB');
