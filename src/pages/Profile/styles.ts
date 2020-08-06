import styled from 'styled-components/native';
import { Platform } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';

interface IPasswordField {
  passwordField: boolean;
}
export const Container = styled.View`
  flex: 1;
  justify-content: center;
  padding: 0 30px ${Platform.OS === 'android' ? 150 : 40}px;
`;

export const Title = styled.Text`
  font-size: 20px;
  color: #f4ede8;
  font-family: 'RobotoSlab-Medium';
  margin: 24px 0;
  text-align: left;
`;

export const UserAvatarButton = styled.TouchableOpacity<IPasswordField>`
  margin-top: ${props => (props.passwordField ? 80 : 210)}px;
`;

export const UserAvatar = styled.Image`
  width: 168px;
  height: 168px;
  border-radius: 84px;
  align-self: center;
`;

export const PasswordButton = styled(RectButton)`
  justify-content: center;
  align-items: center;

  margin: 24px;
`;

export const PasswordButtonText = styled.Text`
  font-size: 18px;
  color: #f4ede8;
  font-family: 'RobotoSlab-Regular';
`;

export const BackButton = styled.TouchableOpacity`
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 10;
  width: 100px;
`;
