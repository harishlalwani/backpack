import type { Token } from "@@types/types";
import type { Blockchain } from "@coral-xyz/common";

import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import { AccountSettingsNavigator } from "@navigation/AccountSettingsNavigator";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getHeaderTitle } from "@react-navigation/elements";
import { createStackNavigator } from "@react-navigation/stack";
import AppListScreen from "@screens/Unlocked/AppListScreen";
import { BalancesNavigator } from "@screens/Unlocked/BalancesScreen";
import {
  DepositListScreen,
  DepositSingleScreen,
} from "@screens/Unlocked/DepositScreen";
import { NftCollectiblesNavigator } from "@screens/Unlocked/NftCollectiblesScreen";
import { RecentActivityScreen } from "@screens/Unlocked/RecentActivityScreen";
import {
  SendTokenDetailScreen,
  SendTokenListScreen,
} from "@screens/Unlocked/SendTokenScreen";
import { WalletListScreen } from "@screens/Unlocked/WalletListScreen";

import {
  IconCloseModal,
  TabIconBalances,
  TabIconApps,
  TabIconNfts,
  TabIconMessages,
} from "@components/Icon";
import { NavHeader } from "@components/index";
import { useTheme } from "@hooks/index";

type UnlockedNavigatorStackParamList = {
  Tabs: undefined;
  AccountSettings: undefined;
  RecentActivity: undefined;
  DepositList: undefined;
  DepositSingle: undefined;
  SendSelectTokenModal: undefined;
  "wallet-picker": undefined;
  SendTokenModal: {
    title: string;
    blockchain: Blockchain;
    token: Token;
  };
  SwapModal: undefined;
};

const Stack = createStackNavigator<UnlockedNavigatorStackParamList>();
export default function UnlockedNavigator(): JSX.Element {
  const theme = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Group>
        <Stack.Screen name="Tabs" component={UnlockedBottomTabNavigator} />
        <Stack.Screen
          name="AccountSettings"
          component={AccountSettingsNavigator}
        />
      </Stack.Group>
      <Stack.Group
        screenOptions={{
          presentation: "modal",
          headerShown: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.custom.colors.fontColor,
          headerBackImage: IconCloseModal,
          // headerStyle: {
          //   backgroundColor: theme.custom.colors.background,
          // },
        }}
      >
        <Stack.Screen name="RecentActivity" component={RecentActivityScreen} />
        <Stack.Screen
          options={{ title: "Deposit" }}
          name="DepositList"
          component={DepositListScreen}
        />
        <Stack.Screen
          options={{ title: "Deposit" }}
          name="DepositSingle"
          component={DepositSingleScreen}
        />
        <Stack.Screen
          options={{ title: "Select Token" }}
          name="SendSelectTokenModal"
          component={SendTokenListScreen}
        />
        <Stack.Screen
          name="SendTokenModal"
          component={SendTokenDetailScreen}
          options={({ route }) => {
            const { title } = route.params;
            return {
              title,
            };
          }}
        />
        <Stack.Screen
          options={{ title: "Swap" }}
          name="SwapModal"
          component={RecentActivityModal}
        />
        <Stack.Screen
          name="wallet-picker"
          component={WalletListScreen}
          options={({ navigation }) => {
            return {
              title: "Wallets",
            };
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}

function RecentActivityModal() {
  return (
    <View style={{ flex: 1, backgroundColor: "pink", alignItems: "center" }}>
      <Text>Recent Activity</Text>
    </View>
  );
}

type UnlockedTabNavigatorParamList = {
  Balances: undefined;
  Applications: undefined;
  Collectibles: undefined;
};

const Tab = createBottomTabNavigator<UnlockedTabNavigatorParamList>();
function UnlockedBottomTabNavigator(): JSX.Element {
  const theme = useTheme();
  const getIcon = useCallback((routeName: string) => {
    switch (routeName) {
      case "Balances":
        return TabIconBalances;
      case "Applications":
        return TabIconApps;
      case "Collectibles":
        return TabIconNfts;
      case "Messages":
        return TabIconMessages;
      default:
        return TabIconBalances;
    }
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        header: ({ navigation, route, options }) => {
          const title = getHeaderTitle(options, route.name);
          return <NavHeader title={title} navigation={navigation} />;
        },
        tabBarIcon: ({ color, size }) => {
          const Component = getIcon(route.name);
          return <Component fill={color} width={size} height={size} />;
        },
        tabBarActiveTintColor: theme.custom.colors.brandColor,
        tabBarInactiveTintColor: theme.custom.colors.icon,
      })}
    >
      <Tab.Screen name="Balances" component={BalancesNavigator} />
      <Tab.Screen name="Applications" component={AppListScreen} />
      <Tab.Screen name="Collectibles" component={NftCollectiblesNavigator} />
    </Tab.Navigator>
  );
}
