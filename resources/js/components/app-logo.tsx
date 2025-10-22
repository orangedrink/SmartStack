import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <AppLogoIcon className="size-8 fill-current text-white dark:text-black" />
            <div className="grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    SmartStack ERP
                </span>
            </div>
        </>
    );
}
