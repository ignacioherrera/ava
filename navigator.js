import { createStackNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation';
import Login from './pages/login';
import Home from './pages/home';
import Sign from './pages/sign';
import Info from './pages/info';
import Profile from './pages/profile';
import AuthLoadingScreen from './components/authLoading';
import NewGift from './pages/addGift';
import Users from './pages/users';
import Initial from './pages/initial';
import CreateUser from './pages/createUser';
import EditGift from './pages/editGift'; 
const AppStack = createStackNavigator({
  Info: { screen: Info },
  Home: { screen: Home },
  Profile: { screen: Profile },
  NewGift: { screen: NewGift },
  Users: { screen: Users },
  EditGift: {screen: EditGift}
},
  {
    headerMode: 'screen',
  });
const AuthStack = createStackNavigator({
  Login: {
    screen: Login,
    navigationOptions: ({ navigation }) => ({
      headerVisible: false
    })
  },
  CreateUser: {
    screen: CreateUser,
    navigationOptions: ({ navigation }) => ({
      headerVisible: false
    })
  },
  Sign: {
    screen: Sign,
    navigationOptions: ({ navigation }) => ({
      headerVisible: false
    })

  }
}); 

export default createAppContainer(createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    Initial: Initial,
    App: AppStack,
    Auth: AuthStack,
  },
  {
    initialRouteName: 'AuthLoading',
  }
));