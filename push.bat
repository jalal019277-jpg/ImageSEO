@echo off
echo ==========================================
echo Starting Git Auto Push Process...
echo ==========================================

:: Git status check kora
git status

:: Sob file add kora
echo.
echo Adding all modified files...
git add .

:: Commit message pawa (user er kach theke input nibe ba default message use korbe)
set /p commitMsg="Enter commit message (or press enter for default): "
if "%commitMsg%"=="" set commitMsg="Update image optimization and metadata logic"

:: Commit kora
echo.
echo Committing changes...
git commit -m "%commitMsg%"

:: GitHub e push kora (main branch ধরে)
echo.
echo Pushing to GitHub (main branch)...
git push origin main

echo ==========================================
echo Successfully pushed to GitHub!
echo ==========================================
pause