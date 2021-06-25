import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '@/store/user/userReducer';
import {
  selectStoreStats, save, clearStoreData, calculateStatSumData,
} from '@/store/storeStats/storeStatsReducer';
import {
  Row, Col, Typography, Divider, Space, Affix,
} from 'antd';
import api from '@/api';
import StoreSelector from '@/components/landing/selectors/StoreSelector.jsx';
import DateSelector from '../landing/selectors/DateSelector.jsx';
import KPISelector from './selectors/KPISelector.jsx';
import CategorySelector from './selectors/CategorySelector.jsx';
import styles from './kpi.module.scss';
import StoreStats from './stats/StoreStats.jsx';
import StoreChart from './chart/StoreChart.jsx';

const { Title } = Typography;

const KpiFrame = () => {
  const user = useSelector(selectUser);
  const storeStats = useSelector(selectStoreStats);
  const dispatch = useDispatch();

  useEffect(() => {
    const storeStatsData = async () => {
      try {
        await user.stores.map(async (store) => {
          const processedData = {};

          processedData.store = store;
          processedData.data = [];

          const requestParams = {
            id: store,
            start_date: storeStats.dateRange[0],
            end_date: storeStats.dateRange[1],
            size: 15,
            page: 1,
          };

          let response;
          let allRequested = true;

          while (allRequested) {
            // eslint-disable-next-line no-await-in-loop
            response = await api.account.kpiData(requestParams);
            processedData.data.push(...response.data.results);

            requestParams.page += 1;
            allRequested = response.data.links.next;
          }

          processedData.data.reverse();
          dispatch(save(processedData));
        });
        return true;
      } catch (err) {
        return false;
      }
    };
    dispatch(clearStoreData());
    storeStatsData();
  }, [dispatch, user.stores, storeStats.dateRange]);

  useEffect(() => {
    if (!storeStats.statsData
      || Object.keys(storeStats.statsData).length === 0
      || !storeStats.selectedStore) {
      return;
    }
    dispatch(calculateStatSumData());
  }, [dispatch, user.stores, storeStats.dateRange,
    storeStats.selectedStore, storeStats.statsData]);

  return (
    <div>
      <Affix offsetTop={64}>

        <Row justify="space-between" align="bottom" className={styles.fixedRow} gutter={[0, 24]}>
          <Col flex="auto">

            <Row>
              <Title level={3} className={styles.bottomAligned}>
                <Space>
                  Estadísticas recientes de la tienda
                  {storeStats.selectedStore}
                </Space>
              </Title>
            </Row>

            <Row>
              <Title level={4} className={styles.bottomAligned}>
                <Space>
                  Entre las fechas:
                  {storeStats.dateRange[0].replace(/-/g, '/')}
                  -
                  {storeStats.dateRange[1].replace(/-/g, '/')}
                </Space>
              </Title>
            </Row>

          </Col>

          <Col>
            <Space>
              <DateSelector />
              <StoreSelector />
              <KPISelector />
              <CategorySelector />
            </Space>
          </Col>
        </Row>

      </Affix>

      <Divider />

      <Row justify="space-between" align="top">
        { Object.keys(storeStats.statsData).length
            && storeStats.statsData[storeStats.selectedStore]
            && storeStats.statsData[storeStats.selectedStore].length
          ? (
            <>
              <Col span={13} className={styles.chartContainer}>
                <StoreChart />
              </Col>
              <Col span={10}>
                <StoreStats />
              </Col>
            </>
          )
          : (
            <Title level={3}>
              <Space>
                No hay estadísticas para esta tienda.
              </Space>
            </Title>
          )}

      </Row>

    </div>
  );
};

export default KpiFrame;
