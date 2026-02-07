/**
 * Google AdSense 광고 슬롯 컴포넌트
 */

import { useEffect, useRef } from 'react';

interface AdUnitProps {
    slot: string;
    format?: string;
    responsive?: boolean;
    style?: React.CSSProperties;
}

// 환경변수 또는 상수로 관리
const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT || 'ca-pub-3155703391875184';

export default function AdUnit({
    slot,
    format = 'auto',
    responsive = true,
    style = {}
}: AdUnitProps) {
    const adRef = useRef<HTMLModElement>(null);
    const pushedRef = useRef(false);

    useEffect(() => {
        // adsbygoogle.push()는 1회만 실행
        if (!pushedRef.current && adRef.current) {
            try {
                ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
                pushedRef.current = true;
            } catch (err) {
                console.error('AdSense error:', err);
            }
        }
    }, []);

    return (
        <div style={{ margin: '20px 0', textAlign: 'center', ...style }}>
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={ADSENSE_CLIENT}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive ? 'true' : 'false'}
            />
        </div>
    );
}
