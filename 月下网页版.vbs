Option Explicit

Dim shell, fso, root, launcher, nodeExe, command
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Function FirstExistingFile(candidates)
  Dim i
  For i = 0 To UBound(candidates)
    If fso.FileExists(candidates(i)) Then
      FirstExistingFile = candidates(i)
      Exit Function
    End If
  Next
  FirstExistingFile = ""
End Function

Function ResolveNodeFromPath(fileName)
  Dim pathValue, parts, i, candidate
  pathValue = shell.Environment("Process")("PATH")
  If Len(pathValue) = 0 Then
    ResolveNodeFromPath = ""
    Exit Function
  End If

  parts = Split(pathValue, ";")
  For i = 0 To UBound(parts)
    If Len(Trim(parts(i))) > 0 Then
      candidate = fso.BuildPath(Trim(parts(i)), fileName)
      If fso.FileExists(candidate) Then
        ResolveNodeFromPath = candidate
        Exit Function
      End If
    End If
  Next

  ResolveNodeFromPath = ""
End Function

Function ResolveNodeExe(projectRoot)
  Dim candidates, fromPath
  candidates = Array( _
    projectRoot & "\runtime\node\nodew.exe", _
    projectRoot & "\runtime\node\node.exe", _
    projectRoot & "\nodew.exe", _
    projectRoot & "\node.exe", _
    shell.ExpandEnvironmentStrings("%USERPROFILE%") & "\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\nodew.exe", _
    shell.ExpandEnvironmentStrings("%USERPROFILE%") & "\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe", _
    "C:\Program Files\nodejs\nodew.exe", _
    "C:\Program Files (x86)\nodejs\nodew.exe", _
    "C:\Program Files\nodejs\node.exe", _
    "C:\Program Files (x86)\nodejs\node.exe" _
  )

  ResolveNodeExe = FirstExistingFile(candidates)
  If Len(ResolveNodeExe) > 0 Then Exit Function

  fromPath = ResolveNodeFromPath("nodew.exe")
  If Len(fromPath) = 0 Then fromPath = ResolveNodeFromPath("node.exe")
  ResolveNodeExe = fromPath
End Function

Sub ShowNodeMissingMessage()
  MsgBox "Node.js was not found, so Yuexia Web cannot start." & vbCrLf & _
    "Install Node.js, or run the project setup/start flow in Codex first.", _
    vbCritical, "Yuexia Web"
End Sub

root = fso.GetParentFolderName(WScript.ScriptFullName)
launcher = root & "\launch-xinyuexia.mjs"
nodeExe = ResolveNodeExe(root)

shell.CurrentDirectory = root

If Len(nodeExe) = 0 Then
  ShowNodeMissingMessage
  WScript.Quit 1
End If

command = """" & nodeExe & """ """ & launcher & """ web"
shell.Run command, 0, False
