import { Ionicons } from "@expo/vector-icons";
import { Camera, GeoJSONSource, Layer, Map, Marker } from "@maplibre/maplibre-react-native";
import { Text, View } from "react-native";
import { useCSSVariable } from "uniwind";

import type { Order, OrderPoint } from "@/lib/api";

/** Keeps the pins clear of the map edges once the route is framed. */
const EDGE_PADDING = { bottom: 90, left: 70, right: 70, top: 70 };

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

const position = (point: OrderPoint): [number, number] => [point.lng, point.lat];

const Pin = ({ color, icon }: { color: string; icon: keyof typeof Ionicons.glyphMap }) => (
  <View
    className="items-center justify-center rounded-pill border-2 border-white"
    style={{ backgroundColor: color, height: 34, width: 34 }}
  >
    <Ionicons color="#ffffff" name={icon} size={18} />
  </View>
);

/**
 * Restaurant, courier and destination on one map. Everything drawn here comes
 * from coordinates stored on the order; nothing is invented when a point is
 * missing, so the map degrades to a message rather than a fictional route.
 */
export function OrderRouteMap({ order }: { order: Order }) {
  const [primary, subtle] = useCSSVariable(["--color-primary", "--color-subtle-foreground"]);

  const pickup = order.restaurantLocation;
  const dropoff = order.deliveryLocation;
  const courier = order.driver?.location;

  const points = [pickup, courier, dropoff].filter((point): point is OrderPoint => Boolean(point));

  if (points.length === 0) {
    return (
      <View className="mx-5 flex-1 items-center justify-center gap-2 rounded-card bg-muted p-6">
        <Ionicons color={subtle as string} name="map-outline" size={32} />
        <Text className="text-center font-heading text-body text-foreground">
          No map for this order
        </Text>
        <Text className="text-center font-sans text-label text-muted-foreground">
          This order was placed before pickup and delivery coordinates were recorded.
        </Text>
      </View>
    );
  }

  const coordinates = points.map(position);
  const longitudes = points.map((point) => point.lng);
  const latitudes = points.map((point) => point.lat);
  const west = Math.min(...longitudes);
  const east = Math.max(...longitudes);
  const south = Math.min(...latitudes);
  const north = Math.max(...latitudes);

  return (
    <Map mapStyle={MAP_STYLE} style={{ flex: 1 }} touchPitch={false} touchRotate={false}>
      <Camera
        initialViewState={
          west === east && south === north
            ? { center: coordinates[0], zoom: 15 }
            : { bounds: [west, south, east, north], padding: EDGE_PADDING }
        }
      />

      {coordinates.length > 1 ? (
        <GeoJSONSource id="order-points" data={{ type: "LineString", coordinates }}>
          <Layer
            id="order-line"
            type="line"
            paint={{ "line-color": primary as string, "line-width": 4 }}
          />
        </GeoJSONSource>
      ) : null}

      {pickup ? (
        <Marker
          id="pickup"
          lngLat={position(pickup)}
          accessibilityLabel={order.restaurantName}
        >
          <Pin color="#102a2a" icon="restaurant" />
        </Marker>
      ) : null}

      {courier ? (
        <Marker
          id="courier"
          lngLat={position(courier)}
          accessibilityLabel={order.driver?.name ?? "Courier"}
        >
          <Pin color={primary as string} icon="bicycle" />
        </Marker>
      ) : null}

      {dropoff ? (
        <Marker
          id="dropoff"
          lngLat={position(dropoff)}
          accessibilityLabel="Your address"
        >
          <Pin color={primary as string} icon="home" />
        </Marker>
      ) : null}

    </Map>
  );
}
