import authBackgroundImage from './Images/background-image.png';

import gayatriImage from './Images/mantras/gayatri.png';
import hareKrishnaImage from './Images/mantras/krishna-hare-krishna.png';
import mahamrityunjayaImage from './Images/mantras/shiva-mahamrityunjaya.png';
import omNamahShivayaImage from './Images/mantras/shiva-om-namah-shivaya.png';

import logoSymbolImage from './Images/common/logoSymbol.png';
import sidebarBackgroundImage from './Images/common/sideBar-background.png';

export const appImages = {
  authBackground: authBackgroundImage,

  mantras: {
    gayatri: gayatriImage,
    hareKrishna: hareKrishnaImage,
    mahamrityunjaya: mahamrityunjayaImage,
    omNamahShivaya: omNamahShivayaImage,
  },

  common: {
    logoSymbol: logoSymbolImage,
    sidebarBackground: sidebarBackgroundImage,
  },
} as const;
