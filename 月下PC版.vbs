Option Explicit

Dim shell, fso, root, launcher, nodeExe, command, packagedExe
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Function ResolveNodeExe(projectRoot)
  Dim candidates, i
  candidates = Array( _
    projectRoot & "\nodew.exe", _
    "C:\Program Files\nodejs\nodew.exe", _
    "C:\Program Files (x86)\nodejs\nodew.exe", _
    "C:\Program Files\nodejs\node.exe", _
    "C:\Program Files (x86)\nodejs\node.exe", _
    projectRoot & "\node.exe" _
  )

  For i = 0 To UBound(candidates)
    If fso.FileExists(candidates(i)) Then
      ResolveNodeExe = candidates(i)
      Exit Function
    End If
  Next

  ResolveNodeExe = "node.exe"
End Function

Sub RunNodeLauncherHidden(nodePath, launcherPath, launcherMode)
  Dim wmi, startup, process, processId, result
  Set wmi = GetObject("winmgmts:\\.\root\cimv2")
  Set startup = wmi.Get("Win32_ProcessStartup").SpawnInstance_
  startup.ShowWindow = 0
  Set process = wmi.Get("Win32_Process")
  command = """" & nodePath & """ """ & launcherPath & """ " & launcherMode
  result = process.Create(command, root, startup, processId)
  If result <> 0 Then
    shell.Run command, 0, False
  End If
End Sub

root = fso.GetParentFolderName(WScript.ScriptFullName)
launcher = root & "\launch-xinyuexia.mjs"
packagedExe = root & "\release\月下写作 0.1.0.exe"
nodeExe = ResolveNodeExe(root)

shell.CurrentDirectory = root
shell.Environment("Process")("XINYUEXIA_START_HASH") = "#/dashboard"
shell.Environment("Process")("XINYUEXIA_DISABLE_ADJUSTMENT_MODE") = "1"
If fso.FileExists(packagedExe) Then
  command = """" & packagedExe & """"
  shell.Run command, 1, False
Else
  If LCase(fso.GetFileName(nodeExe)) = "nodew.exe" Then
    command = """" & nodeExe & """ """ & launcher & """ desktop"
    shell.Run command, 0, False
  Else
    RunNodeLauncherHidden nodeExe, launcher, "desktop"
  End If
End If
