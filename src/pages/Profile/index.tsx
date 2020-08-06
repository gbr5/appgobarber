import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import * as Yup from 'yup';
import ImagePicker from 'react-native-image-picker';
import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import api from '../../services/api';

import getValidationErrors from '../../utils/getValidationErros';

import Input from '../../components/Input';
import Button from '../../components/Button';

import { useAuth } from '../../hooks/auth';

import {
  Container,
  Title,
  UserAvatar,
  UserAvatarButton,
  PasswordButton,
  PasswordButtonText,
  BackButton,
} from './styles';

interface ProfileFormData {
  name: string;
  email: string;
  old_password: string;
  password: string;
  password_confirmation: string;
}

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [passwordField, setPasswordField] = useState(false);

  const formRef = useRef<FormHandles>(null);
  const { goBack } = useNavigation();

  const emailInputRef = useRef<TextInput>(null);
  const oldPasswordInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const passwordConfirmationInputRef = useRef<TextInput>(null);

  const handleProfile = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required('Nome é obrigatório'),
          email: Yup.string()
            .required('E-mail é obrigatório')
            .email('Digite um e-mail válido'),
          old_password: Yup.string(),
          password: Yup.string().when('old_password', {
            is: val => !!val?.length,
            then: Yup.string().required('Campo obrigatório.').min(6),
            otherwise: Yup.string(),
          }),
          password_confirmation: Yup.string()
            .when('old_password', {
              is: val => !!val?.length,
              then: Yup.string().required('Campo obrigatório.').min(6),
              otherwise: Yup.string(),
            })
            .oneOf(
              [Yup.ref('password'), undefined],
              'As senhas devem ser iguais.',
            ),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const {
          email,
          name,
          old_password,
          password,
          password_confirmation,
        } = data;

        const formData = {
          name,
          email,
          ...(old_password
            ? {
                old_password,
                password,
                password_confirmation,
              }
            : {}),
        };

        const response = await api.put('/profile', formData);

        updateUser(response.data);

        Alert.alert(
          'Atualização realizada',
          'O seu perfil foi atualizado com sucesso.',
        );

        goBack();
      } catch (err) {
        console.log(err);
        if (err instanceof Yup.ValidationError) {
          const error = getValidationErrors(err);

          formRef.current?.setErrors(error);

          return;
        }

        Alert.alert(
          'Erro na atualização!',
          'Ocorreu um erro ao atualizar o perfil, tente novamente.',
        );
      }
    },
    [goBack, updateUser],
  );

  const handleUpdateAvatar = useCallback(() => {
    ImagePicker.showImagePicker(
      {
        title: 'Selecione o avatar',
        cancelButtonTitle: 'Cancelar',
        takePhotoButtonTitle: 'Usar câmera',
        chooseFromLibraryButtonTitle: 'Escolher da galeria',
      },
      response => {
        if (response.didCancel) {
          return;
        }

        if (response.error) {
          Alert.alert('Erro ao atualizar o seu avatar.');

          return;
        }

        const data = new FormData();

        data.append('avatar', {
          type: 'image/jpeg',
          name: `${user.id}.jpg`,
          uri: response.data,
        });

        api.patch('users/avata', data).then(updateResponse => {
          updateUser(updateResponse.data);
        });
      },
    );
  }, [user.id, updateUser]);

  const handlePasswordField = useCallback(() => {
    setPasswordField(state => !state);
  }, []);

  const handleGoBack = useCallback(() => {
    goBack();
  }, [goBack]);

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behaviour={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flex: 1 }}
        >
          <Container>
            <BackButton onPress={handleGoBack}>
              <Icon name="chevron-left" size={40} color="#999591" />
            </BackButton>
            <UserAvatarButton
              passwordField={passwordField}
              onPress={handleUpdateAvatar}
            >
              <UserAvatar source={{ uri: user.avatar_url }} />
            </UserAvatarButton>

            <View>
              <Title>Meu perfil</Title>
            </View>
            <Form initialData={user} ref={formRef} onSubmit={handleProfile}>
              <Input
                autoCapitalize="words"
                name="name"
                icon="user"
                returnKeyType="next"
                onSubmitEditing={() => emailInputRef.current?.focus()}
              />
              <Input
                ref={emailInputRef}
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="email-address"
                name="email"
                icon="mail"
                returnKeyType={passwordField ? 'next' : 'send'}
                onSubmitEditing={() => oldPasswordInputRef.current?.focus()}
              />

              <PasswordButton onPress={handlePasswordField}>
                <PasswordButtonText>Trocar a senha</PasswordButtonText>
                {passwordField ? (
                  <Icon name="chevron-up" size={24} color="#999591" />
                ) : (
                  <Icon name="chevron-down" size={24} color="#999591" />
                )}
              </PasswordButton>

              {passwordField && (
                <>
                  <Input
                    ref={oldPasswordInputRef}
                    secureTextEntry
                    name="old_password"
                    icon="lock"
                    placeholder="Senha atual"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                    textContentType="newPassword"
                  />
                  <Input
                    ref={passwordInputRef}
                    secureTextEntry
                    name="password"
                    icon="lock"
                    placeholder="Nova senha"
                    returnKeyType="next"
                    onSubmitEditing={() =>
                      passwordConfirmationInputRef.current?.focus()
                    }
                    textContentType="newPassword"
                  />
                  <Input
                    ref={passwordConfirmationInputRef}
                    secureTextEntry
                    name="password_confirmation"
                    icon="lock"
                    placeholder="Confirme a sua senha"
                    returnKeyType="send"
                    onSubmitEditing={() => formRef.current?.submitForm()}
                    textContentType="newPassword"
                  />
                </>
              )}

              <Button
                onPress={() => formRef.current?.submitForm()}
                style={{ marginBottom: 130 }}
              >
                Confirmar mudanças
              </Button>
            </Form>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Profile;
