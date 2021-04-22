import React from "react";
import Styles from './index.module.less';

function Home() {
  return (
    <div className={Styles.home}>
      <h2 className={Styles.homeApp}>Home View</h2>
      <p>在React中使用React Router v6 的指南</p>
    </div>
  );
}

export default Home;
