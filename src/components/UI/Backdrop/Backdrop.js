import React from "react";
import cssClasses from './Backdrop.module.css'
const backdrop = (props) => (
    props.show ? <div className={cssClasses.backdrop}></div> : null //ternary exp if prop.show is true then return div else
)

export default backdrop
