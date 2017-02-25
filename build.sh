current_path=`pwd`

cordova build --release > ${current_path}/build.log

cd ${current_path}/platforms/android/build/outputs/apk
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ${current_path}/keystore/fwedapps.keystore android-release-unsigned.apk alias_name >> ${current_path}/build.log
#zipalign -v 4 android-release-unsigned.apk HomeUtils.apk >> ${current_path}/build.log

rm -f ${current_path}/gally-client-arm7.apk
rm -f ${current_path}/gally-client-x86.apk
mv -f ${current_path}/platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk ${current_path}/gally-client-arm7.apk
mv -f ${current_path}/platforms/android/build/outputs/apk/android-x86-release-unsigned.apk ${current_path}/gally-client-x86.apk
