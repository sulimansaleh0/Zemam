import Image from "next/image";
import React from "react";
import arrowLeftIcon from "../assets/arrow-left.svg";

type BaseProps = {
  children: React.ReactNode;
  className?: string;
  showArrow?: boolean;
  fullWidth?: boolean;
};

type LinkProps = BaseProps & {
  href: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  type?: never;
};

type ButtonProps = BaseProps & {
  href?: never;
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
};

export type PrimaryButtonProps = LinkProps | ButtonProps;

export function PrimaryButton(props: PrimaryButtonProps) {
  const { children, className = "", showArrow = false, fullWidth = false } = props;

  const baseClasses =
    "inline-flex items-center justify-center gap-2 min-h-[46px] max-[520px]:min-h-[44px] px-[22px] max-[520px]:px-[18px] text-[14px] font-bold leading-none whitespace-nowrap rounded-[10px] no-underline transition-all duration-180 ease-out active:translate-y-0 focus-visible:outline-2 focus-visible:outline-blue-600/90 focus-visible:outline-offset-[3px] motion-reduce:transition-none bg-primary border border-primary text-white shadow-[0_8px_18px_rgba(15,118,110,0.16)] hover:bg-primary-hover hover:border-primary-hover hover:text-white hover:shadow-[0_12px_24px_rgba(15,118,110,0.22)] hover:-translate-y-px cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

  const classes = [baseClasses, fullWidth && "w-full", className]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {showArrow && (
        <Image
          src={arrowLeftIcon}
          alt=""
          width={16}
          height={16}
          className="w-4 h-4 shrink-0"
        />
      )}
      <span>{children}</span>
    </>
  );

  if ("href" in props && props.href) {
    return (
      <a href={props.href} className={classes} onClick={props.onClick}>
        {content}
      </a>
    );
  }

  const { type = "button", onClick, disabled } = props as ButtonProps;
  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {content}
    </button>
  );
}
