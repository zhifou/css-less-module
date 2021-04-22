import React from 'react';
import Styles from './index.module.less';

const About = () => {
    return (
        <div className={Styles.About}>
            我是about的内容
            <p className={Styles.About_ABC}>我是断论</p>
        </div>
    )
}

export default About;