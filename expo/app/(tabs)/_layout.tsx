import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { MessageCircle, Phone, CircleDot, Settings } from "lucide-react-native";
import TEXAColors from "@/constants/colors";

function TabIcon({
  Icon,
  color,
  focused,
}: {
  Icon: typeof MessageCircle;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={styles.iconContainer}>
      <Icon size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: TEXAColors.gold[400],
        tabBarInactiveTintColor: TEXAColors.dark[500],
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={MessageCircle} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="calls"
        options={{
          title: "Calls",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Phone} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="status"
        options={{
          title: "Status",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={CircleDot} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Settings} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: TEXAColors.bgDarkSecondary,
    borderTopColor: TEXAColors.dark[200],
    borderTopWidth: 0.5,
    height: 90,
    paddingTop: 10,
    paddingBottom: 28,
    elevation: 0,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
    letterSpacing: 0.3,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  activeDot: {
    position: "absolute",
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: TEXAColors.gold[400],
  },
});
