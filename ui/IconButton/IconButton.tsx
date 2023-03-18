import { MouseEventHandler, ReactNode } from "react";
import cx from "classnames";
import styles from "./styles.module.css";

export type IconButtonProps = {
    onClick: MouseEventHandler<HTMLButtonElement>;
    className?: string;
    children?: ReactNode;
}

export const IconButton = ({ onClick, className, children }: IconButtonProps) => (
    <button className={cx(styles.iconButton, className)} onClick={onClick}>
        {children}
    </button>
)