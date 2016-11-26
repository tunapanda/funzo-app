    [ -n "$P" ] && { echo $P ; exit 0; }
#!/bin/bash
##
## This script takes one or more .json files describing copies of a book, and 
## outputs an equal number of .zip files containing encrypted book contents.
## See USAGE below for details on running it.
##

if [ $# -eq 0 ]
then
	echo ""
	echo "USAGE: $(basename $0) DOWNLOAD_CODE.json... [TARGET_DIRECTORY]"
	echo "See README.md and the provided book.json for details on the file format"
	echo "If the last argument is a directory, zipfiles will be generated there."
	echo "Otherwise, they will be generated in the current directory."
	echo ""
	exit 1
fi	

function realpath() {
    # Linux (doesn't work in OSX)
    P="$(readlink -f $1 2>/dev/null)"
    [ -n "$P" ] && { echo $P ; exit 0; }

    # symlink in OSX
    P="$(readlink $1)"
    [ -n "$P" ] && { echo $P ; exit 0; }

    # non-symlink abs or rel path in OSX
    P="$1"
    [ "$P" = "/*" ] && echo $P || echo "$(pwd)/$P"
}

ORIGDIR=$(pwd)
SCRIPTDIR=$(dirname $(realpath $0))
BOOKDIRBASE=$(realpath ${SCRIPTDIR}/../build)
rm -rf $BOOKDIRBASE 2>/dev/null
mkdir -p $BOOKDIRBASE 2>/dev/null

# Get last arg. If it is a directory, output there.
for arg in $@; do :; done
if [ -d "$arg" ]
then
    ZIPDIR=$(realpath $arg) 
else 
	ZIPDIR=$(realpath ${SCRIPTDIR}/..)
fi

for BOOKJSON in $@
do
	[ -f "$BOOKJSON" ] || continue
	BOOKID=$(basename $BOOKJSON .json)
	BOOKDIR=$(${SCRIPTDIR}/encrypt.js --force --dir=$BOOKDIRBASE $BOOKJSON) &&
	cd $BOOKDIR &&
	ZIPFN=${ZIPDIR}/${BOOKID}.zip &&
	zip -r $ZIPFN .  &&
	echo "$ZIPFN" 
done
cd $ORIGDIR