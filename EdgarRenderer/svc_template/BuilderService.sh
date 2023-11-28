#!/bin/bash
if [ "$ROOT" == "" ]
then
    export ROOT=~/re3
fi
ARCONF=$ROOT
RE=$ROOT/Re
SRC=$RE/src
SVC=$RE/svc1
FAIL=$SVC/error.log
if [ "$ARELLE" == "" ]
then
    export ARELLE=$ROOT/Arelle
    export PYTHONPATH=.:$SRC:$ARELLE
fi
if [ "$EXE"=="" ]
then
    export EXE=~/bin/python3.3  # need up to date Python, not Red Hat's python
    export LD_LIBRARY_PATH=~/lib # need very latest libxml2 and other libraries
fi
cd $SVC

TOT_COUNT=0
GOOD_COUNT=0
FAIL_COUNT=0

ldt=`date --rfc-3339=seconds`
ldtForFileName=`echo $ldt | tr ' ' '_' `
echo [$ldt] Starting Rendering Daemon
export currentlog=daemon_${ldtForFileName}.log
PIDFILE=$SVC/pid.pid
echo $$ > $PIDFILE

MORE=true
while [ "$MORE" == "true" ]
do
    $EXE -m EdgarRenderer -c BuilderService.xml --logfile $currentlog --logLevel debug --xdgConfigHome "$ARCONF"
    if [ -f "$FAIL" ] # test if $FAIL file exists and is a regular file
    then
        echo FILING FAILED PROCESSING
        rm $FAIL # remove the failure-indication file
        FAIL_COUNT=`expr $FAIL_COUNT + 1`
    else
        GOOD_COUNT=`expr $GOOD_COUNT + 1`
    fi
    ldt=`date --rfc-3339=seconds`
    TOT_COUNT=`expr $TOT_COUNT + 1`
    echo "[$ldt] Processed another"
    echo "Good Filings: [$GOOD_COUNT]; Bad Filings: [$FAIL_COUNT]; Total Filings: [$TOT_COUNT]"
    echo "$ldt [stat] Good Filings: [$GOOD_COUNT]; Bad Filings: [$FAIL_COUNT]; Total Filings: [$TOT_COUNT]" >> ${currentlog}
    # cp $currentlog+daemon.log entire_daemon.log >> daemon.log
    # mv /y tempmaster3.log $currentlog >> daemon.log

    # MORE=false # uncomment this line for debugging one filing and then stopping
done
