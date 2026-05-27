Option Explicit

Dim shell, fso, root, launcher, nodeExe, command, packagedExe
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Function ResolveNodeExe(projectRoot)
  Dim candidates, i
  candidates = Array( _
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

root = fso.GetParentFolderName(WScript.ScriptFullName)
launcher = root & "\launch-xinyuexia.mjs"
packagedExe = root & "\release\月下写作 0.1.0.exe"
nodeExe = ResolveNodeExe(root)

shell.CurrentDirectory = root
shell.Environment("Process")("XINYUEXIA_START_HASH") = "#/adjustment-mode"
If fso.FileExists(packagedExe) Then
  command = """" & packagedExe & """"
  shell.Run command, 1, False
Else
  command = """" & nodeExe & """ """ & launcher & """ adjustment"
  shell.Run command, 0, True
End If
