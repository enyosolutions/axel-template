const request = require('request');

declare const axel: any;

const getFacebookAccountDetails = (token: string) =>
  new Promise((resolve, reject) => {
    request(
      {
        url: `${axel.config.facebook.graphApiUrl}?fields=id,email,first_name,last_name&access_token=${token}`,
        method: 'GET',
      },
      (err: Error, resp: Response, body: any) => {
        if (err) {
          return reject('error_fb_profile_not_found');
        }

        let facebookProfileData;

        try {
          facebookProfileData = JSON.parse(body);
        } catch (e) {
          return reject('error_fb_profile_not_found');
        }

        if (!facebookProfileData) {
          return reject('error_fb_profile_not_found');
        }

        resolve({
          facebookId: facebookProfileData.id,
          email: facebookProfileData.email,
          firstName: facebookProfileData.first_name,
          lastName: facebookProfileData.last_name,
        });
      },
    );
  });

export default {
  getFacebookAccountDetails,
};
