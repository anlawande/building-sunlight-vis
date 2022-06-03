function sunpos(when, location, refraction) {
    // # Extract the passed data
    const [year, month, day, hour, minute, second, timezone] = when;
    const [latitude, longitude] = location;

    // Convert latitude and longitude to radians
    const rlat = toRadians(latitude)
    const rlon = toRadians(longitude)
    // Decimal hour of the day at Greenwich
    const greenwichtime = hour - timezone + minute / 60 + second / 3600
    // Days from J2000, accurate from 1901 to 2099
    const daynum = (
        367 * year
        - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4)
            + Math.floor(275 * month / 9)
            + day
            - 730531.5
            + greenwichtime / 24
        );
    // Mean longitude of the sun
    const mean_long = daynum * 0.01720279239 + 4.894967873;
    // Mean anomaly of the Sun
    const mean_anom = daynum * 0.01720197034 + 6.240040768;
    // Ecliptic longitude of the sun
    const eclip_long = (
        mean_long
        + 0.03342305518 * Math.sin(mean_anom)
        + 0.0003490658504 * Math.sin(2 * mean_anom)
    );
    // Obliquity of the ecliptic
    const obliquity = 0.4090877234 - 0.000000006981317008 * daynum;
    // Right ascension of the sun
    const rasc = Math.atan2(Math.cos(obliquity) * Math.sin(eclip_long), Math.cos(eclip_long));
    // Declination of the sun
    const decl = Math.asin(Math.sin(obliquity) * Math.sin(eclip_long));
    // Local sidereal time
    const sidereal = 4.894961213 + 6.300388099 * daynum + rlon;
    // Hour angle of the sun
    const hour_ang = sidereal - rasc;
    // Local elevation of the sun
    let elevation = Math.asin(Math.sin(decl) * Math.sin(rlat) + Math.cos(decl) *
        Math.cos(rlat) * Math.cos(hour_ang));
    // Local azimuth of the sun
    let azimuth = Math.atan2(
        -Math.cos(decl) * Math.cos(rlat) * Math.sin(hour_ang),
        Math.sin(decl) - Math.sin(rlat) * Math.sin(elevation),
    );
    // Convert azimuth and elevation to degrees
    azimuth = intoRange(toDegrees(azimuth), 0, 360);
    elevation = intoRange(toDegrees(elevation), -180, 180);
    // Refraction correction (optional)
    if (refraction) {
        const targ = toRadians((elevation + (10.3 / (elevation + 5.11))));
        elevation += (1.02 / Math.tan(targ)) / 60;
    }
    // Return azimuth and elevation in degrees
    return [+azimuth.toFixed(2), +elevation.toFixed(2)];
}

function toRadians(degrees)
{
    var pi = Math.PI;
    return degrees * (pi/180);
}

function toDegrees(radians) {
    var pi = Math.PI;
    return radians * (180/pi);
}

function intoRange(x, range_min, range_max) {
    const shiftedx = x - range_min;
    const delta = range_max - range_min;
    return (((shiftedx % delta) + delta) % delta) + range_min;
}

function sunposXYZ(sphereRad, azimuth, elevation) {
    const azimuthRadians = toRadians(azimuth);
    const elevationRadians = toRadians(elevation);
    const z = Math.sin(elevationRadians) * sphereRad;
    const sphereSliceRad = Math.cos(elevationRadians) * sphereRad;
    const x = Math.sin(azimuthRadians) * sphereSliceRad;
    const y = Math.cos(azimuthRadians) * sphereSliceRad;
    return [x, y, z];
}

export default { sunpos, sunposXYZ };
