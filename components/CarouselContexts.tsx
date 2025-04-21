import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { contexts } from "~/constants/contexts";
import { CarouselItem } from "./CarouselItem";
import { Dimensions } from 'react-native';

export function CarouselContexts() {
	const scrollOffsetValue = useSharedValue<number>(0);

	const screenWidth = Dimensions.get('window').width;

	return (
		<View>
			<Carousel
				loop={true}
				width={screenWidth}
				height={350}
				snapEnabled={true}
				pagingEnabled={true}
				autoPlayInterval={5000}
				data={contexts}
				defaultScrollOffsetValue={scrollOffsetValue}
				onConfigurePanGesture={(g: { enabled: (arg0: boolean) => any }) => {
					"worklet";
					g.enabled(false);
				}}
				onSnapToItem={(index: number) => console.log("current index:", index)}
				renderItem={({ item, index }) => <CarouselItem context={item} key={index}/>}
			/>
		</View>
	);
}