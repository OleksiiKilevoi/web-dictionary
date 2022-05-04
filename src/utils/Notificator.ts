export interface Notificator{
  sendOtp(phoneNumber: string, otp: string): any;
}
