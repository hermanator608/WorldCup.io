const ASSET_NAMES: string[] = ['ship.svg', 'bullet.svg'];

// tslint:disable-next-line:no-any
const assets: { [key: string]: HTMLImageElement } = {};

const downloadAsset: (assetName: string) => Promise<void> = assetName =>
  new Promise(resolve => {
    const asset = new Image();
    asset.onload = () => {
      console.log(`Downloaded ${assetName}`);
      assets[assetName] = asset;
      resolve();
    };
    asset.src = `/assets/${assetName}`;
  });

// Function to download all assets
export const downloadAssets: () => void = () => Promise.all(ASSET_NAMES.map(downloadAsset));
export const getAsset: (assetName: string) => HTMLImageElement = assetName => assets[assetName];
