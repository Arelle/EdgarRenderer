@echo off
SETLOCAL
if "%ROOT%"=="" set ROOT=C:\re3
@rem Parent location of Arelle config files and cache
if "%ARCONF%"=="" set ARCONF="%ROOT%"
@rem Location for Arelle modules
if "%ARELLE%"=="" set ARELLE=%ROOT%\Arelle
@rem Location for EdgarRenderer modules
if "%EDGARRENDERER%"=="" set EDGARRENDERER=%ROOT%\EdgarRenderer

set PYTHONPATH=.;%EDGARRENDERER%;%ARELLE%

@rem  Typical location for the builder service
if "%SVC%"=="" set SVC=%ROOT%\svc1
@rem FAIL filename must match the fail file name in BuilderServies.xml
set FAIL=%SVC%\error.log

if "%PYTHONEXE%"=="" (
	if exist c:\python34\python.exe (
		set PYTHONEXE=c:\python34\python.exe
	) else if exist c:\python33\python.exe (
		set PYTHONEXE=c:\python33\python.exe
	) else set PYTHONEXE=python.exe
 )
cd %SVC%

SET /A TOT_COUNT=0
SET /A GOOD_COUNT=0
SET /A FAIL_COUNT=0

for /F "usebackq tokens=1,2 delims==" %%i in (`wmic os get LocalDateTime /VALUE 2^>NUL`) do if '.%%i.'=='.LocalDateTime.' set ldt=%%j
set ldt=%ldt:~0,4%-%ldt:~4,2%-%ldt:~6,2% %ldt:~8,2%:%ldt:~10,2%:%ldt:~12,6%
echo [%ldt%] Starting Rendering Daemon
SET currentlog=daemon_%ldt:~0,10%_%ldt:~11,2%%ldt:~14,2%%ldt:~17,2%.log

:begin
@echo on
%PYTHONEXE% -m EdgarRenderer -c BuilderService.xml --xdgConfigHome "%ARCONF%"  --logfile %currentlog% --logLevel info 
@echo off

if NOT exist "%FAIL%" goto :fine
echo FILING FAILED TO RENDER (see [name]_errorLog.txt file in /Delivery folder)
del %FAIL%
SET /A FAIL_COUNT+=1
goto :wrapup

:fine
SET /A GOOD_COUNT+=1

:wrapup
for /F "usebackq tokens=1,2 delims==" %%i in (`wmic os get LocalDateTime /VALUE 2^>NUL`) do if '.%%i.'=='.LocalDateTime.' set ldt=%%j
set ldt=%ldt:~0,4%-%ldt:~4,2%-%ldt:~6,2% %ldt:~8,2%:%ldt:~10,2%:%ldt:~12,6%
echo [%ldt%] Processed another
SET /A TOT_COUNT+=1

:report
echo Successful Renderings: [%GOOD_COUNT%]; Failed Renderings: [%FAIL_COUNT%]; Total Processed: [%TOT_COUNT%]
echo %ldt% [stat] Successful Renderings: [%GOOD_COUNT%]; Failed Renderings: [%FAIL_COUNT%]; Total Processed: [%TOT_COUNT%] >>%currentlog%

:concat
rem copy %currentlog%+daemon.log entire_daemon.log >>daemon.log
rem move /y tempmaster3.log %currentlog% >>daemon.log

goto :begin
ENDLOCAL