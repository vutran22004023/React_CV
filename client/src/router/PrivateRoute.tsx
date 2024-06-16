import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { updateUser } from '@/redux/Slides/userSide'; // Adjust path as necessary
import { success, error, warning } from "@/components/MessageComponents/Message";

interface DecodedToken {
  id: string;
  isAdmin: boolean;
  exp: number;
}

const PrivateRoute: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = getAccessTokenFromCookie();
      if (!accessToken) {
        error('Hiện tại bạn chưa đăng nhập');
        return;
      }

      const decodedToken = decodeAccessToken(accessToken);

      if (decodedToken && decodedToken.exp * 1000 < Date.now()) {
        try {
          const refreshedToken = await refreshAccessToken(accessToken);
          if (refreshedToken) {
            updateAccessTokenInCookie(refreshedToken);
            handleGetDetailsUser(decodedToken.id, refreshedToken);
          } else {
            navigate('/login');
          }
        } catch (error) {
          console.error('Error refreshing token:', error);
          navigate('/login');
        }
      } else if (decodedToken) {
        handleGetDetailsUser(decodedToken.id, accessToken);
      }
    };

    checkAuth();
  }, [navigate]);

  const getAccessTokenFromCookie = (): string | null => {
    const cookieData = document.cookie;
    if (cookieData) {
      const cookieArr = cookieData.split(';');
      const accessTokenCookie = cookieArr.find(cookie => cookie.trim().startsWith('access_Token='));

      if (accessTokenCookie) {
        return accessTokenCookie.split('=')[1];
      }
    }
    return null;
  };

  const decodeAccessToken = (token: string): DecodedToken | null => {
    try {
      console.log(token);
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Error decoding access token:', error);
      return null;
    }
  };

  const refreshAccessToken = async (token: string): Promise<string | null> => {
    try {
      const response = await axios.post<{ accessToken: string }>('/api/refresh-token', {
        refreshToken: token
      });

      if (response.data.accessToken) {
        return response.data.accessToken;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  };

  const updateAccessTokenInCookie = (accessToken: string) => {
    document.cookie = `access_Token=${accessToken}; httpOnly; secure; sameSite=Strict; max-age=${15 * 60}`;
  };

  const handleGetDetailsUser = async (userId: string, accessToken: string) => {
    try {
      const response = await axios.get(`/api/user/get-detail-user/${userId}`, {
        headers: {
          token: `Bearer ${accessToken}`
        }
      });
      console.log(response);
      dispatch(updateUser({ ...response.data.data[0], access_Token: accessToken }));
    } catch (error) {
      console.error('Error fetching user details:', error);
      navigate('/');
    }
  };

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default PrivateRoute;