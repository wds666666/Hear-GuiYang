export function wgs84ToGcj02(lat, lng) {
  const x = lng - 105;
  const y = lat - 35;
  const pi = Math.PI;
  let dLat = -100 + 2*x + 3*y + .2*y*y + .1*x*y + .2*Math.sqrt(Math.abs(x));
  dLat += (20*Math.sin(6*x*pi) + 20*Math.sin(2*x*pi))*2/3;
  dLat += (20*Math.sin(y*pi) + 40*Math.sin(y/3*pi))*2/3;
  dLat += (160*Math.sin(y/12*pi) + 320*Math.sin(y*pi/30))*2/3;
  let dLng = 300 + x + 2*y + .1*x*x + .1*x*y + .1*Math.sqrt(Math.abs(x));
  dLng += (20*Math.sin(6*x*pi) + 20*Math.sin(2*x*pi))*2/3;
  dLng += (20*Math.sin(x*pi) + 40*Math.sin(x/3*pi))*2/3;
  dLng += (150*Math.sin(x/12*pi) + 300*Math.sin(x/30*pi))*2/3;
  const rad = lat*pi/180;
  const ee = .006693421622965943;
  const a = 6378245;
  let m = Math.sin(rad);
  m = 1 - ee*m*m;
  const s = Math.sqrt(m);
  return [lat + dLat*180/((a*(1-ee))/(m*s)*pi), lng + dLng*180/(a/s*Math.cos(rad)*pi)];
}
