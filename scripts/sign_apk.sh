#!/bin/bash

if [ -z "$1" ]
then
	echo "USAGE $(basename $0) [MYKEYS.keystore [KEYNAME]] APK..."
    exit
fi

# If the first arg looks like a keystore, use it instead of the default
if echo $1 | grep '\.keystore$' &>/dev/null
then 
    KS="$1"
    shift

    # If the keystore is followed by something other than a .apk
    # file, assume it is the name of the key to use.
    if echo $1 | grep -v '\.apk$' &>/dev/null
    then
        KEY="$1"
        shift
    else
        KEY="funzo-app"
    fi
# Othwerwise, use these defaults
else
    KS="./funzo-app.keystore"
    KEY="funzo-app"  # note: older versions used e.g. funzo-app-certell
fi

if [ ! -e $KS ]
then
    echo "ERROR: Could not find keystore ${KS}" >&2
    exit 1
fi

if which gsed &>/dev/null
then
    SED=gsed
else
    SED=sed
fi

for fn in $@
do
	basefn="$(echo $(basename ${fn%.apk}) | $SED 's,-[a-z]*signed,,i' | $SED 's,-[a-z]*aligned,,i')"
	signedfn="${basefn}-signed-unaligned"
	alignedfn="${basefn}-signed-aligned"
	(cp $fn ${signedfn}.apk
	jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore $KS ${signedfn}.apk $KEY &&
	jarsigner -verify -verbose -certs ${signedfn}.apk &&
	zipalign -v 4 ${signedfn}.apk ${alignedfn}-$(date +%Y%m%d%H%M).apk &&
	echo "DONE with ${alignedfn}.apk") || echo "*** ERROR processing $fn" 2>&1
	rm -f ${signedfn}.apk 2> /dev/null
done
