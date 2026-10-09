import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import am5geodata_worldLow from '@amcharts/amcharts5-geodata/worldLow';
import { markets, paymentRoutes } from '../data/paymentRoutes';
const MIN_MS = 4200;
const SAFETY_MS = 9000;
const ROUTE_MS = 480;

const ease = [0.22, 1, 0.36, 1];

// Financial-hub coordinates for each corridor market.
const HUBS = {
  MA: { latitude: 34.02, longitude: -6.84 },
  DZ: { latitude: 36.75, longitude: 3.06 },
  EG: { latitude: 30.04, longitude: 31.24 },
  ET: { latitude: 9.03, longitude: 38.74 },
  CI: { latitude: 5.36, longitude: -4.0 },
  CM: { latitude: 3.85, longitude: 11.5 },
  PK: { latitude: 24.86, longitude: 67.0 },
};

const MARKET_IDS = markets.map((m) => m.id);
const MARKET = Object.fromEntries(markets.map((m) => [m.id, m]));

const LEAD_CORRIDOR = { id: 'EG', pos: 'top', delay: 0.5 };
const CORRIDORS = [
  { id: 'MA', pos: 'tr', delay: 1 },
  { id: 'PK', pos: 'tl', delay: 1.4 },
  { id: 'ET', pos: 'bl', delay: 1.8 },
  { id: 'CI', pos: 'br', delay: 2.2 },
];

const COLOR = {
  ocean: 0x0b1730,
  land: 0x152a4d,
  coast: 0x38bdf8,
  market: 0xea580c,
  marketEdge: 0xfdba74,
  route: 0xf97316,
  routeActive: 0xfbbf24,
  packet: 0xfde68a,
};

function PaymentGlobe({ activeRoute, entered, onReady, reducedMotion }) {
  const hostRef = useRef(null);
  const rootRef = useRef(null);
  const linesRef = useRef([]);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const root = am5.Root.new(hostRef.current);
    rootRef.current = root;
    if (root._logo) root._logo.dispose();

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: 'none',
        panY: 'none',
        wheelX: 'none',
        wheelY: 'none',
        projection: am5map.geoOrthographic(),
        rotationX: 5,
        rotationY: -18,
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
      }),
    );

    const ocean = chart.series.push(am5map.MapPolygonSeries.new(root, {}));
    ocean.mapPolygons.template.setAll({
      fill: am5.color(COLOR.ocean),
      fillOpacity: 1,
      strokeOpacity: 0,
    });
    ocean.data.push({ geometry: am5map.getGeoRectangle(90, 180, -90, -180) });

    const graticule = chart.series.push(am5map.GraticuleSeries.new(root, { step: 15 }));
    graticule.mapLines.template.setAll({
      stroke: am5.color(COLOR.coast),
      strokeOpacity: 0.07,
      strokeWidth: 0.6,
    });

    const countries = chart.series.push(
      am5map.MapPolygonSeries.new(root, { geoJSON: am5geodata_worldLow, exclude: ['AQ'] }),
    );
    countries.mapPolygons.template.setAll({
      fill: am5.color(COLOR.land),
      stroke: am5.color(COLOR.coast),
      strokeOpacity: 0.28,
      strokeWidth: 0.5,
    });
    countries.mapPolygons.template.adapters.add('fill', (fill, target) =>
      MARKET_IDS.includes(target.dataItem?.get('id')) ? am5.color(COLOR.market) : fill,
    );
    countries.mapPolygons.template.adapters.add('stroke', (stroke, target) =>
      MARKET_IDS.includes(target.dataItem?.get('id')) ? am5.color(COLOR.marketEdge) : stroke,
    );

    const lineSeries = chart.series.push(am5map.MapLineSeries.new(root, {}));
    lineSeries.mapLines.template.setAll({
      stroke: am5.color(COLOR.route),
      strokeOpacity: 0.55,
      strokeWidth: 1.6,
    });

    const hubSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));
    hubSeries.bullets.push(() => {
      const container = am5.Container.new(root, {});
      const ring = container.children.push(
        am5.Circle.new(root, { radius: 4, fill: am5.color(COLOR.route), fillOpacity: 0.35 }),
      );
      container.children.push(
        am5.Circle.new(root, {
          radius: 2.6,
          fill: am5.color(0xffffff),
          stroke: am5.color(COLOR.route),
          strokeWidth: 1.2,
        }),
      );
      if (!reducedMotion) {
        ring.animate({ key: 'radius', from: 3, to: 11, duration: 1600, loops: Infinity });
        ring.animate({ key: 'fillOpacity', from: 0.45, to: 0, duration: 1600, loops: Infinity });
      }
      return am5.Bullet.new(root, { sprite: container });
    });

    const hubItems = {};
    MARKET_IDS.forEach((id) => {
      hubItems[id] = hubSeries.pushDataItem(HUBS[id]);
    });

    const packetSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));
    packetSeries.bullets.push(() =>
      am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 2.4,
          fill: am5.color(COLOR.packet),
          shadowColor: am5.color(COLOR.routeActive),
          shadowBlur: 10,
          shadowOpacity: 0.9,
        }),
      }),
    );

    linesRef.current = paymentRoutes.map((route, i) => {
      const line = lineSeries.pushDataItem({
        pointsToConnect: [hubItems[route.from], hubItems[route.to]],
      });
      if (!reducedMotion) {
        const packet = packetSeries.pushDataItem({ lineDataItem: line, positionOnLine: 0 });
        packet.animate({
          key: 'positionOnLine',
          from: 0,
          to: 1,
          duration: 1400 + (i % 4) * 260,
          loops: Infinity,
        });
      }
      return line;
    });

    if (!reducedMotion) {
      chart.animate({
        key: 'rotationX',
        from: 5,
        to: -40,
        duration: MIN_MS + 800,
        easing: am5.ease.out(am5.ease.cubic),
      });
    }

    root.events.once('frameended', () => onReadyRef.current?.());
    chart.appear(900, 0);

    return () => {
      linesRef.current = [];
      rootRef.current = null;
      root.dispose();
    };
    // The globe is built once; motion preference is read at mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // amCharts sizes its canvas from the transformed (mid-scale-in) box and
  // won't re-measure on its own, so resize once the entrance has settled.
  useEffect(() => {
    if (entered) rootRef.current?.resize();
  }, [entered]);

  useEffect(() => {
    linesRef.current.forEach((line, i) => {
      const sprite = line.get('mapLine');
      if (!sprite || sprite.isDisposed()) return;
      const on = i === activeRoute;
      sprite.setAll({
        stroke: am5.color(on ? COLOR.routeActive : COLOR.route),
        strokeOpacity: on ? 1 : 0.45,
        strokeWidth: on ? 2.8 : 1.6,
      });
    });
  }, [activeRoute]);

  return <div ref={hostRef} className="preloader-globe-canvas" aria-hidden="true" />;
}

function CorridorChip({ id, pos, delay }) {
  const { name, currency } = MARKET[id];
  return (
    <div className={`corridor-chip corridor-chip--${pos}`} style={{ animationDelay: `${delay}s` }}>
      <span className="corridor-chip-code">{currency}</span>
      <span className="corridor-chip-text">
        {name}
        <span className="corridor-chip-arrow">→</span>
        USD
      </span>
    </div>
  );
}

export default function Preloader() {
  const reducedMotion = useReducedMotion() ?? false;
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [routeIndex, setRouteIndex] = useState(0);
  const [globeReady, setGlobeReady] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const [globeEntered, setGlobeEntered] = useState(false);
  const done = progress >= 100;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    let frame;
    const start = performance.now();
    const tick = (now) => {
      // rAF timestamps can be slightly earlier than `start`, so clamp at 0 too.
      const t = Math.min(1, Math.max(0, (now - start) / MIN_MS));
      setProgress(Math.round((1 - (1 - t) ** 2) * 100));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const min = window.setTimeout(() => setMinElapsed(true), MIN_MS);
    const safety = window.setTimeout(() => setVisible(false), SAFETY_MS);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(min);
      window.clearTimeout(safety);
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (done) return undefined;
    const id = window.setInterval(
      () => setRouteIndex((i) => (i + 1) % paymentRoutes.length),
      ROUTE_MS,
    );
    return () => window.clearInterval(id);
  }, [done]);

  useEffect(() => {
    if (!minElapsed || !globeReady) return undefined;
    const id = window.setTimeout(() => setVisible(false), 500);
    return () => window.clearTimeout(id);
  }, [minElapsed, globeReady]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        document.body.style.overflow = '';
      }}
    >
      {visible && (
        <motion.div
          className="preloader"
          role="status"
          aria-live="polite"
          aria-label="Loading nSERVE Cross-Border Payments"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          <div className="preloader-stars" aria-hidden="true" />

          <CorridorChip {...LEAD_CORRIDOR} />

          <motion.div
            className="preloader-globe"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.25 }}
            transition={{ duration: 0.9, ease }}
            onAnimationComplete={() => setGlobeEntered(true)}
          >
            <div className="preloader-atmosphere" aria-hidden="true" />
            <PaymentGlobe
              activeRoute={done ? -1 : routeIndex}
              entered={globeEntered}
              onReady={() => setGlobeReady(true)}
              reducedMotion={reducedMotion}
            />
          </motion.div>

          <motion.div
            className="preloader-corridors"
            aria-hidden="true"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease }}
          >
            {CORRIDORS.map((corridor) => (
              <CorridorChip key={corridor.id} {...corridor} />
            ))}
          </motion.div>

          <div className="preloader-foot">
            <div className="preloader-meter">
              <span>Connecting markets</span>
              <span className="preloader-percent">{progress}%</span>
            </div>
            <div className="preloader-bar" aria-hidden="true">
              <div className="preloader-bar-fill" style={{ transform: `scaleX(${progress / 100})` }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
