import AppKit

func hex(_ s: String) -> (CGFloat, CGFloat, CGFloat) {
    let v = String(s.dropFirst())
    let r = CGFloat(Int(v.prefix(2), radix: 16)!) / 255.0
    let g = CGFloat(Int(v.dropFirst(2).prefix(2), radix: 16)!) / 255.0
    let b = CGFloat(Int(v.dropFirst(4).prefix(2), radix: 16)!) / 255.0
    return (r, g, b)
}

let colors: [String: String] = [
    "ANSIBlackColor": "#1B2228",
    "ANSIRedColor": "#FF715B",
    "ANSIGreenColor": "#55D6BE",
    "ANSIYellowColor": "#F4D35E",
    "ANSIBlueColor": "#72A8D8",
    "ANSIMagentaColor": "#9F5EF4",
    "ANSICyanColor": "#76E5FC",
    "ANSIWhiteColor": "#EEFFFF",
    "ANSIBrightBlackColor": "#8493A4",
    "ANSIBrightRedColor": "#FF8A74",
    "ANSIBrightGreenColor": "#7DE8D2",
    "ANSIBrightYellowColor": "#F8E08A",
    "ANSIBrightBlueColor": "#8FBEEC",
    "ANSIBrightMagentaColor": "#B883F7",
    "ANSIBrightCyanColor": "#9BEEFF",
    "ANSIBrightWhiteColor": "#FFFFFF",
    "BackgroundColor": "#212329",
    "TextColor": "#EEFFFF",
    "TextBoldColor": "#EEFFFF",
    "SelectionColor": "#9A275A",
    "CursorColor": "#9F5EF4",
]

var profile: [String: Any] = [
    "name": "Motion Haleness",
    "type": "Window Settings",
    "ProfileCurrentVersion": 2.04,
    "columnCount": 90,
    "rowCount": 50,
]

for (key, value) in colors {
    let (r, g, b) = hex(value)
    let color = NSColor(deviceRed: r, green: g, blue: b, alpha: 1.0)
    let data = try! NSKeyedArchiver.archivedData(withRootObject: color, requiringSecureCoding: false)
    profile[key] = data
}

let output = CommandLine.arguments[1]
let plistData = try! PropertyListSerialization.data(fromPropertyList: profile, format: .xml, options: 0)
try! plistData.write(to: URL(fileURLWithPath: output))
print("Written \(output)")
