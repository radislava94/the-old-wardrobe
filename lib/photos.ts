import type { StaticImageData } from "next/image";
import beanie from "../mockup/img/beanie.jpg";
import bomber from "../mockup/img/bomber.jpg";
import denim from "../mockup/img/denim.jpg";
import floralDress from "../mockup/img/floral-dress.jpg";
import heroRack from "../mockup/img/hero-rack.jpg";
import leather from "../mockup/img/leather.jpg";
import maxiDress from "../mockup/img/maxi-dress.jpg";
import poncho from "../mockup/img/poncho.jpg";
import trench from "../mockup/img/trench.jpg";
import type { PhotoKey } from "./types";

export const photos: Record<PhotoKey, StaticImageData> = {
  beanie,
  bomber,
  denim,
  "floral-dress": floralDress,
  leather,
  "maxi-dress": maxiDress,
  poncho,
  trench,
};

export const heroPhoto: StaticImageData = heroRack;
