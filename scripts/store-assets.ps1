Add-Type -AssemblyName System.Drawing
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$assetRoot = Join-Path $projectRoot 'store-assets'
[IO.Directory]::CreateDirectory($assetRoot) | Out-Null

function New-Brush([string] $hex) {
  [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml($hex))
}

$canvas = [Drawing.Bitmap]::new(440, 280)
$draw = [Drawing.Graphics]::FromImage($canvas)
$draw.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
$draw.TextRenderingHint = [Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$paper = New-Brush '#F1F0E8'
$ink = New-Brush '#2C332B'
$muted = New-Brush '#707969'
$accent = New-Brush '#A05244'
$line = [Drawing.Pen]::new([Drawing.ColorTranslator]::FromHtml('#CCD1C1'), 1)
$brand = [Drawing.Font]::new('Segoe UI', 12, [Drawing.FontStyle]::Bold, [Drawing.GraphicsUnit]::Pixel)
$title = [Drawing.Font]::new('Segoe UI', 42, [Drawing.FontStyle]::Bold, [Drawing.GraphicsUnit]::Pixel)
$body = [Drawing.Font]::new('Segoe UI', 15, [Drawing.FontStyle]::Regular, [Drawing.GraphicsUnit]::Pixel)
$small = [Drawing.Font]::new('Segoe UI', 11, [Drawing.FontStyle]::Regular, [Drawing.GraphicsUnit]::Pixel)
try {
  $draw.FillRectangle($paper, 0, 0, 440, 280)
  $draw.DrawString('R E C E I P T S', $brand, $ink, 28, 22)
  $draw.DrawString('Read the', $title, $ink, 25, 66)
  $draw.DrawString('receipts.', $title, $accent, 25, 112)
  $draw.DrawString('Campaign finance, beside the name.', $body, $muted, 28, 181)
  $draw.DrawLine($line, 28, 225, 412, 225)
  $draw.DrawString('Public records. Local matching.', $small, $muted, 28, 243)
  $draw.DrawString('shin86dev', $small, $ink, 356, 243)
  $canvas.Save((Join-Path $assetRoot 'promo-440x280.png'), [Drawing.Imaging.ImageFormat]::Png)
} finally {
  $draw.Dispose()
  $canvas.Dispose()
  foreach ($resource in @($paper, $ink, $muted, $accent, $line, $brand, $title, $body, $small)) { $resource.Dispose() }
}
Copy-Item -LiteralPath (Join-Path $projectRoot 'dist/icons/128.png') -Destination (Join-Path $assetRoot 'icon-128.png') -Force
Write-Output 'Created 440x280 promotional artwork and copied the packaged 128px icon.'
