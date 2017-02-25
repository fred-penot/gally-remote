path_install=`pwd`
cd ${path_install}

npm install > ${path_install}/install.log
cordova platform add android >> ${path_install}/install.log
ionic hooks add >> ${path_install}/install.log
