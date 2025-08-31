import { WhatAreYouLookingEnum } from "../../users/enum/whatareyoulooking.enum";

export interface SocialInterface {
  id: string;
  fullName?: string;
  nickName?: string;
  email?: string;
  bio?: string;
  phoneNumber?: string;
  whatAreYouLookingFor?: WhatAreYouLookingEnum
}
