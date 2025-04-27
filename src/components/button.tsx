import {type ComponentProps, forwardRef} from "react";

type ButtonProps = ComponentProps<"button">;

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props: ButtonProps, ref) => {
    return (
        <button ref={ref} type="button" {...props} />
    )
})

export default Button;
