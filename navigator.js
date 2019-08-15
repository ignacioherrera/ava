import { createStackNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation';
import Login from './pages/login';
import Home from './pages/home';
import Sign from './pages/sign';
import Info from './pages/info';
import Profile from './pages/profile';
import EventChat from './pages/eventChat';
import AuthLoadingScreen from './components/authLoading';
import NewGift from './pages/addGift';
import Users from './pages/users';
const AppStack = createStackNavigator({
  Info: { screen: Info }, 
  Home: { screen: Home },
  Profile: { screen: Profile },
  NewGift: { screen: NewGift },
  Users:{screen: Users},
  EventChat:{
    screen:EventChat
  }
},
  {
    headerMode: 'screen', 
  });
const AuthStack = createStackNavigator({ 
  Sign: {screen: Sign, 
    navigationOptions: ({ navigation }) => ({
      headerVisible: false
    })
  
  },
  
});

export default createAppContainer(createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: AppStack,
    Auth: AuthStack,
  },
  {
    initialRouteName: 'AuthLoading',
  }
));