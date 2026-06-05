[Setup]
AppName=Dr. Astro
AppVersion=1.0.0
DefaultDirName={autopf}\DrAstro
DefaultGroupName=Dr. Astro
OutputDir=dist\windows
OutputBaseFilename=DrAstro-Setup
Compression=lzma
SolidCompression=yes

[Files]
Source: "build\windows\x64\runner\Release\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Dr. Astro"; Filename: "{app}\dr_astro.exe"
Name: "{commondesktop}\Dr. Astro"; Filename: "{app}\dr_astro.exe"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Run]
Filename: "{app}\dr_astro.exe"; Description: "{cm:LaunchProgram,Dr. Astro}"; Flags: nowait postinstall skipifsilent
