// src/lib/adService.ts
import { AdMob, InterstitialAdPluginEvents, RewardAdPluginEvents } from '@capacitor-community/admob';
import { ADMOB_CONFIG } from '../constants/adMobConfig';

export const initializeAdMob = async () => {
  try {
    await AdMob.initialize({ appId: ADMOB_CONFIG.appId });
  } catch (error) {
    console.error("AdMob initialization failed", error);
  }
};

export const showInterstitialAd = async () => {
  try {
    await AdMob.prepareInterstitial({ adId: ADMOB_CONFIG.interstitialAdId, isTesting: false });
    await AdMob.showInterstitial();
  } catch (error) {
    console.error("Failed to show interstitial ad", error);
  }
};

export const showRewardedAd = async (): Promise<boolean> => {
  try {
    await AdMob.prepareRewardVideoAd({ adId: ADMOB_CONFIG.rewardedAdId, isTesting: false });
    
    // We need to listen to reward event
    return new Promise((resolve) => {
      AdMob.addListener(RewardAdPluginEvents.Rewarded, (info) => {
        resolve(true); // Reward granted
      });
      
      AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => {
        resolve(false);
      });

      AdMob.showRewardVideoAd();
    });
  } catch (error) {
    console.error("Failed to show rewarded ad", error);
    return false;
  }
};
